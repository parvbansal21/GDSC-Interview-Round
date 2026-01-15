# Firestore Data Schema

## Collections

### users/{uid}
```json
{
  "uid": "string",
  "currentStreak": 0,
  "longestStreak": 0,
  "lastAttemptDate": "YYYY-MM-DD | null",
  "totalAttempts": 0,
  "missedDays": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Subcollections

**users/{uid}/dailyAttempts/{YYYY-MM-DD}**
```json
{
  "viewedAt": "timestamp",
  "submitted": false,
  "submissionId": "string | null",
  "submittedAt": "timestamp | null"
}
```

**users/{uid}/submissions/{submissionId}**
```json
{
  "questionId": "YYYY-MM-DD",
  "dateKey": "YYYY-MM-DD",
  "answer": "string",
  "submittedAt": "timestamp"
}
```

### dailyQuestions/{YYYY-MM-DD}
```json
{
  "title": "string",
  "description": "string",
  "difficulty": "Easy | Medium | Hard",
  "topic": "string",
  "createdAt": "timestamp"
}
```

### dailySolutions/{YYYY-MM-DD}
```json
{
  "solution": "string",
  "createdAt": "timestamp"
}
```
