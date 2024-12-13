import { useEffect, useState } from "react";
//i used the A4 useSession.js file for inspiration/to help me make this file
import db from "./db.js";

export default function useSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session;
}
