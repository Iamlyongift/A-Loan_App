// import { Request } from "express";

// interface UserRequest extends Request {
//   user?: Record<string, any>;
// }

// export default UserRequest;

import { Request } from "express";

export interface UserPayload {
  _id: string;
  // Add other properties that your user object might have
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
