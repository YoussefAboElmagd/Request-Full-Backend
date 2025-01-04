import Visitor from "../../../database/models/visitor.model";



export const totalVisitors=async function getTotalVisitors(req, res) {
    try {
        const totalVisitors = await Visitor.countDocuments();
        res.json({totalVisitors  });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const addNewVisitor= async function addNewVisitor(req, res) {
    const { visitorId } = req.body;
    const now = new Date();

    try {
        const existingVisitor = await Visitor.findOne({ visitorId });
        if (existingVisitor) {
            const timeDifference = (now - new Date(existingVisitor.lastVisit)) / (1000 * 60 * 60);
console.log(timeDifference);

            if (timeDifference > 24) {
                existingVisitor.isNew = true;
            }

            existingVisitor.lastVisit = now;
            await existingVisitor.save();

        }
else{ 
    await Visitor.create({
    visitorId,
    isNew: true,
    lastVisit: now,
});}
       

const newVisitorCount = await Visitor.countDocuments({ isNew: true, $and: [{ lastVisit: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }] });
        res.json({ newVisitorCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const returningVisitors = async function getReturningVisitors(req, res) {
    try {
        const now = new Date();
        
        const returningVisitors = await Visitor.countDocuments({
            isNew: false,
            lastVisit: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        });

        res.json({ returningVisitors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
