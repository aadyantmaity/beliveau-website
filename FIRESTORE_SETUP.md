# Firestore Setup and Security Rules

This document explains the Firestore security rules and user data management for the Beliveau Data application.

## Security Rules

The Firestore security rules are configured with `rules_version = '2'` and implement the following security model:

### Default Rule

- **Deny all access** by default for maximum security
- All collections and documents are protected unless explicitly allowed

### Users Collection

- **Authenticated users can read and write their own data**
- Users can only access documents where the document ID matches their UID
- This ensures users can only see and modify their own profile information

## User Data Structure

When a user signs up (either via email/password or Google OAuth), the following data is stored in the `users` collection:

```javascript
{
  email: "user@example.com",
  uid: "firebase-user-id",
  createdAt: "2024-01-01T00:00:00.000Z",
  displayName: "User Name", // null for email/password users
  photoURL: "https://...", // null for email/password users
  lastLoginAt: "2024-01-01T00:00:00.000Z",
  authProvider: "email" | "google",
  isActive: true,
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## Deployment

### Prerequisites

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase project: `firebase init`

### Deploy Rules

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Or use the provided script
chmod +x deploy-firestore-rules.sh
./deploy-firestore-rules.sh
```

### Deploy Everything

```bash
# Deploy rules, indexes, and hosting
firebase deploy
```

## Security Features

### Authentication Required

- All user data access requires authentication
- Unauthenticated users cannot read or write any data

### User Isolation

- Users can only access their own profile data
- No cross-user data access is possible
- Each user's data is isolated by their UID

### Data Protection

- Email addresses are stored securely
- Profile information is protected
- Login timestamps are tracked for security monitoring

## Testing Security Rules

You can test the security rules using the Firebase Console:

1. Go to Firestore Database in Firebase Console
2. Navigate to Rules tab
3. Use the Rules Playground to test different scenarios:
   - Authenticated user accessing their own data (should succeed)
   - Authenticated user accessing another user's data (should fail)
   - Unauthenticated user accessing any data (should fail)

## Monitoring

Monitor user activity through:

- Firebase Authentication logs
- Firestore usage metrics
- Security rules evaluation counts

## Troubleshooting

### Common Issues

1. **Rules not deployed**: Ensure you're logged into the correct Firebase project
2. **Permission denied**: Check that the user is authenticated and accessing their own data
3. **Rules syntax error**: Validate rules in Firebase Console before deployment

### Debugging

- Use Firebase Console to view real-time rule evaluations
- Check Firebase Functions logs for server-side operations
- Monitor authentication state in the application
