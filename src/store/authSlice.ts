import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface User { uid:string; name:string; phone:string; email:string; role:string; wallet:number; kyc:string; rtaiScore:number; commissionEarned:number; joined:string; }
interface AuthState { user:User|null; isAuthenticated:boolean; }
const initialState:AuthState = { user:null, isAuthenticated:false };
const authSlice = createSlice({ name:"auth", initialState, reducers: {
  setUser:(state,action:PayloadAction<User>) => { state.user=action.payload; state.isAuthenticated=true; },
  logout:(state) => { state.user=null; state.isAuthenticated=false; },
  updateWallet:(state,action:PayloadAction<number>) => { if(state.user) state.user.wallet=action.payload; }
}});
export const { setUser, logout, updateWallet } = authSlice.actions;
export default authSlice.reducer;
