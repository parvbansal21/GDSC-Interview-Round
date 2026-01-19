const questions = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers and a target, return indices of the two numbers such that they add up to the target.\n\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n```",
    difficulty: "Easy",
    topic: "Arrays",
    solution:
      "Use a hash map to store each number and its index. For each element x, check if target - x exists in the map. If yes, return the indices.\n\n```\nmap = {}\nfor i, x in nums:\n  if (target - x) in map:\n    return [map[target - x], i]\n  map[x] = i\n```",
  },
  {
    title: "Valid Parentheses",
    description:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\n```\nInput: s = \"()[]{}\"\nOutput: true\n\nInput: s = \"(]\"\nOutput: false\n```",
    difficulty: "Easy",
    topic: "Stack",
    solution:
      "Use a stack. Push opening brackets, pop for closing brackets and check if they match.\n\n```\nstack = []\nmap = {')': '(', '}': '{', ']': '['}\nfor char in s:\n  if char in map:\n    if not stack or stack.pop() != map[char]:\n      return false\n  else:\n    stack.push(char)\nreturn stack is empty\n```",
  },
  {
    title: "Reverse Linked List",
    description:
      "Given the head of a singly linked list, reverse the list and return the reversed list.\n\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```",
    difficulty: "Easy",
    topic: "Linked List",
    solution:
      "Use three pointers: prev, curr, next. Iterate through the list, reversing each pointer.\n\n```\nprev = null\ncurr = head\nwhile curr:\n  next = curr.next\n  curr.next = prev\n  prev = curr\n  curr = next\nreturn prev\n```",
  },
  {
    title: "Maximum Subarray",
    description:
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\n```\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.\n```",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    solution:
      "Use Kadane's algorithm. Track current sum and max sum. Reset current sum if it goes negative.\n\n```\nmax_sum = nums[0]\ncurr_sum = nums[0]\nfor i from 1 to len(nums):\n  curr_sum = max(nums[i], curr_sum + nums[i])\n  max_sum = max(max_sum, curr_sum)\nreturn max_sum\n```",
  },
  {
    title: "Binary Search",
    description:
      "Given a sorted array of integers and a target value, return the index if found. If not, return -1.\n\n```\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\n```",
    difficulty: "Easy",
    topic: "Binary Search",
    solution:
      "Use two pointers (left, right). Check middle element, narrow search space accordingly.\n\n```\nleft, right = 0, len(nums) - 1\nwhile left <= right:\n  mid = (left + right) // 2\n  if nums[mid] == target:\n    return mid\n  elif nums[mid] < target:\n    left = mid + 1\n  else:\n    right = mid - 1\nreturn -1\n```",
  },
];

export const seedTodayQuestion = async () => {
  const dateKey = getDateKey();
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  await setDoc(doc(db, "dailyQuestions", dateKey), {
    title: randomQuestion.title,
    description: randomQuestion.description,
    difficulty: randomQuestion.difficulty,
    topic: randomQuestion.topic,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "dailySolutions", dateKey), {
    solution: randomQuestion.solution,
    createdAt: serverTimestamp(),
  });
};

export const seedQuestionForDate = async (dateKey: string, questionIndex: number) => {
  const question = questions[questionIndex % questions.length];

  await setDoc(doc(db, "dailyQuestions", dateKey), {
    title: question.title,
    description: question.description,
    difficulty: question.difficulty,
    topic: question.topic,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "dailySolutions", dateKey), {
    solution: question.solution,
    createdAt: serverTimestamp(),
  });
};

