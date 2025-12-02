import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password?: string;
    budgetLimit: number;
    age: number;
    height: number;
    weight: number;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    waterLogs: { date: Date; amount: number }[];
    waterIntake: number;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    budgetLimit: { type: Number, default: 0 },
    age: { type: Number, default: 25 },
    height: { type: Number, default: 175 }, // cm
    weight: { type: Number, default: 70 }, // kg
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'moderate' },
    waterLogs: [{
        date: { type: Date, required: true },
        amount: { type: Number, required: true }
    }],
    waterIntake: { type: Number, default: 0 }
});

export default mongoose.model<IUser>('User', UserSchema);
