import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import query from '../utils/query'; // Adjust the import path as necessary
// Define a type for the profile returned by Passport strategies
interface IProfile {
  id: string;
  displayName?: string;
  email?: string;
  emails?:any,
  photos?: { value: string }[];
}

// Define Passport callback types
type VerifyCallback = (error: any, user?: any | false) => void;

// Passport strategy for Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8001/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken: string, refreshToken: string, profile: IProfile, done: VerifyCallback) => {
      try {
        const { id, displayName, photos } = profile;
        console.log("inside google-passport-setup", profile);
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
        console.log("email", email);


        // Check if user already exists
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        // console.log("userResult", userResult);
        let user = userResult.rows[0];
        console.log("user", user);
        if (!user) {
          const result = await query(
            'INSERT INTO users (oauth_id, name, email, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, displayName || 'Anonymous', email, photos?.[0]?.value || '']
          );
          user = result.rows[0];
        } 
        

        done(null, user);
      } catch (error) {
        console.log("Error: ", error);
        return done(error);
      }
    }
  )
);


// Serialize and deserialize user
passport.serializeUser((user: any, done: (error: any, id?: string) => void) => {
  console.log('Serializing user:', user); // Check the user object here
  if (!user || !user.user_id) {
    return done(new Error('User object is missing or does not have an id'));
  }
  done(null, user.user_id);
});


passport.deserializeUser(async (user_id: string, done: (error: any, user?: any | null) => void) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [user_id]);
    console.log('Deserialized user:', result.rows[0]); // Check what user is returned
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error);
  }
});
