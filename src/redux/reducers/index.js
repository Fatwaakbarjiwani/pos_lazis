import { combineReducers } from "redux";
import authReducer from "./authReducer";
import posReducer from "./posReducer";

export default combineReducers({
  auth: authReducer,
  pos: posReducer,
});
