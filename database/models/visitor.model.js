import { Schema, model } from 'mongoose';

const visitorSchema = new Schema({
    visitorId: { type: String, required: true, unique: true },
    isNew: { type: Boolean, required: true },
    lastVisit: { type: Number, required: true },
});

const Visitor = model('Visitor', visitorSchema);

export default Visitor;
