import fsExtra from "fs-extra";
import path from "path";

export function removeFiles(folderName, fieldName) {
  if (!fieldName || !Array.isArray(fieldName)) {
    console.error("fieldName is either undefined or not an array");
    return;
  }
  const photoPaths =
    fieldName &&
    fieldName.map((url) =>
      url.replace(`https://tchatpro.com/${folderName}/`, "")
    );
  console.log(photoPaths);

  photoPaths.forEach((photoPath) => {
    // Resolve the full path to the file
    const fullPath = path.resolve(`uploads/${folderName}`, photoPath);
    // Check if the file exists
    fsExtra.access(fullPath, fsExtra.constants.F_OK, (err) => {
      if (err) {
        console.error("File does not exist or cannot be accessed");
        return;
      }
      // Delete the file
      fsExtra.unlink(fullPath, (err) => {
        if (err) {
          console.error("Error deleting the file:", err);
        } else {
          console.log("Files deleted successfully");
        }
      });
    });
  });
}

export function removeFile(folderName, fieldName) {
  console.log(fieldName);

  const photoPath = fieldName.replace(
    `https://tchatpro.com/${folderName}/`,
    ""
  );
  const fullPath = path.resolve(`uploads/${folderName}`, photoPath);
  // Check if the file exists
  fsExtra.access(fullPath, fsExtra.constants.F_OK, (err) => {
    if (err) {
      console.error("File does not exist or cannot be accessed");
      return;
    }
    // Delete the file
    fsExtra.unlink(fullPath, (err) => {
      if (err) {
        console.error("Error deleting the file:", err);
      } else {
        console.log("File deleted successfully");
      }
    });
  });
}
