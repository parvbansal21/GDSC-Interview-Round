const parseDateKey = (dateKey: string) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const getDateKey = (date: Date = new Date()) => {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const diffDays = (fromKey: string, toKey: string) => {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const getTodayQuestion = async (
  dateKey: string
): Promise<DailyQuestion | null> => {
  const questionRef = doc(db, "dailyQuestions", dateKey);
  const snap = await getDoc(questionRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<DailyQuestion, "id">) };
};

export const getTodaySolution = async (
  dateKey: string
): Promise<DailySolution | null> => {
  const solutionRef = doc(db, "dailySolutions", dateKey);
  const snap = await getDoc(solutionRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<DailySolution, "id">) };
};

export const lockQuestionAfterView = async (
  dateKey: string
): Promise<DailyAttempt> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const attemptRef = doc(db, "users", user.uid, "dailyAttempts", dateKey);
  const attemptSnap = await getDoc(attemptRef);

  if (!attemptSnap.exists()) {
    await setDoc(attemptRef, {
      viewedAt: serverTimestamp(),
      submitted: false,
      submissionId: null,
    });
    return { submitted: false };
  }

  return attemptSnap.data() as DailyAttempt;
};

export const submitAnswer = async (
  dateKey: string,
  questionId: string,
  answer: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const submissionRef = doc(
    collection(db, "users", user.uid, "submissions")
  );

  await setDoc(submissionRef, {
    questionId,
    dateKey,
    answer: answer.trim(),
    submittedAt: serverTimestamp(),
  });

  const attemptRef = doc(db, "users", user.uid, "dailyAttempts", dateKey);
  await setDoc(
    attemptRef,
    {
      submitted: true,
      submissionId: submissionRef.id,
      submittedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return submissionRef.id;
};

export const updateUserStreak = async (dateKey: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userRef = doc(db, "users", user.uid);

  return runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(userRef);

    const data: UserProfile = snap.exists()
      ? (snap.data() as UserProfile)
      : {
          uid: user.uid,
          currentStreak: 0,
          longestStreak: 0,
          lastAttemptDate: null,
          totalAttempts: 0,
          missedDays: 0,
        };

    const lastDate: string | null = data.lastAttemptDate ?? null;

    if (lastDate === dateKey) {
      return data;
    }

    let currentStreak = data.currentStreak ?? 0;
    let longestStreak = data.longestStreak ?? 0;
    let missedDays = data.missedDays ?? 0;
    let totalAttempts = data.totalAttempts ?? 0;

    if (!lastDate) {
      currentStreak = 1;
    } else {
      const gap = diffDays(lastDate, dateKey);
      if (gap === 1) {
        currentStreak += 1;
      } else if (gap > 1) {
        missedDays += gap - 1;
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    totalAttempts += 1;

    tx.set(
      userRef,
      {
        uid: user.uid,
        currentStreak,
        longestStreak,
        lastAttemptDate: dateKey,
        totalAttempts,
        missedDays,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      currentStreak,
      longestStreak,
      totalAttempts,
      missedDays,
    };
  });
};
