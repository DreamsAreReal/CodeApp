/** Authenticated session — userId + mode, obtained once at boot. */
import { api } from "../api/client.ts";
import { tg } from "../telegram/webapp.ts";

class Session {
  userId = 0;
  mode: "dev" | "telegram" = "dev";
  authed = false;

  async authenticate(): Promise<void> {
    // api.auth stores the session token + credentials internally, so every subsequent
    // request carries `Authorization: Bearer <token>` and can silently re-auth on 401.
    const res = await api.auth(tg.authCredentials());
    this.userId = res.userId;
    this.mode = res.mode;
    this.authed = true;
  }
}

export const session = new Session();
