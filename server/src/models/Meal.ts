import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number;
    date: Date;
}

const MealSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

export default mongoose.model<IMeal>('Meal', MealSchema);
