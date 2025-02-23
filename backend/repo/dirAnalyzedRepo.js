import FileString from "../models/dirAnalyzed.js";

const dirAnalyzedRepo = async (fileStringData) => {
    for(const fileStringDatum of fileStringData) {
        try {
            const fileString = new FileString(fileStringDatum);

            const result = await fileString.save();

            console.log("Document inserted:", result);
            return result;
        } catch (err) {
            console.error("Error inserting document:", err);
            throw new Error("Failed to insert document into MongoDB");
        }
    }
};

export { dirAnalyzedRepo };
