import Visitor from "../../../database/models/visitor.model.js";


export const addNewVisitor = async function (req, res) {

    const { visitorId } = req.body;
    const nowInHours = Math.floor(new Date().getTime() / (1000 * 60 * 60));
    try {
        const existingVisitor = await Visitor.findOne({ visitorId });
        if (!existingVisitor) {
            await Visitor.create({
                visitorId,
                isNew: true,
                lastVisit: nowInHours,
            })
            return res.json({ message: "Visitor added successfully" });
        }
        return
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export const countVisitors = async (req, res) => {
    try {
        const { visitorId } = req.body;
        const nowInHours = Math.floor(new Date().getTime() / (1000 * 60 * 60));

        let visitor;
        if (visitorId) {
            visitor = await Visitor.findOne({ visitorId });
            console.log("old", visitor);
        } else {
            return res.status(400).json({ message: "visitorId is required" });
        }
        if (!visitor) {
            // If the visitor does not exist, create a new one
            return 
        }
        const lastseen = Math.abs((nowInHours - visitor.lastVisit));

        // Update the visitor if they are a returning visitor
        if (lastseen <= 24) {
            visitor.isNew = false;
            await visitor.save();

        } else {
            visitor.isNew = true;
            await visitor.save();
            console.log("true");
        }

        const [totalVisitors, returningVisitorCount, newVisitorCount] = await Promise.all([
            Visitor.countDocuments(),
            Visitor.countDocuments({
                isNew: false
            }),
            Visitor.countDocuments({

                isNew: true

            })
        ]);

        visitor.lastVisit = nowInHours;
        await visitor.save();

        return res.json({ message: "Done", totalVisitors, newVisitorCount, returningVisitorCount });
    } catch (error) {
        console.error("Error in counting visitors:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

