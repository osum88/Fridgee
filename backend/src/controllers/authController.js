import { createUserService, getUserByEmailService, getUserByUsernameService } from "../models/userModel.js";
import handleResponse from "../utils/responseHandler.js"
import bcrypt from "bcrypt";
import { generateAuthToken } from "../utils/token.js";

export const signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const existingUserByEmail = await getUserByEmailService(email);
        if (existingUserByEmail) {
            return handleResponse(res, 409, "A user with this email already exists"); 
        }

        const existingUserByUsername = await getUserByUsernameService(username);
        if (existingUserByUsername) {
            return handleResponse(res, 409, "A user with this username already exists"); 
        }
      
        const newUser = await createUserService(null, null, username, null, email, password, false, null, false);
        const token = generateAuthToken(newUser);   
        handleResponse(res, 201, "User created successfully", { token, user: newUser });
    } 
    catch(err){
        next(err);
    }
};

export const login = async (req, res, next ) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmailService(email);
        if (!user){
            return handleResponse(res, 400, "Wrong email or password");
        }

        const isSame = await bcrypt.compare(password, user.passwordHash);
        if(!isSame) {
            return handleResponse(res, 400, "Wrong email or password");
        }

        const token = generateAuthToken(user);   
        const { passwordHash, ...userWithoutHash } = user;
        return handleResponse(res, 200, "Login successful", { token, user: userWithoutHash });
    } 
    catch(err){
        next(err);
    }
};