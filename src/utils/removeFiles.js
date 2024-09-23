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
      url.replace(`http://62.72.32.44:8000/${folderName}/`, "")
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
  const photoPath = fieldName.replace(
    `http://62.72.32.44:8000/${folderName}/`,
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
export const photoUpload = (req, fieldName, uploadDirectory) => {
  let fileUrl = "";

  if (req.files && req.files[fieldName]) {
    // Generate file URLs
    req.body[fieldName] = req.files[fieldName].map(
      (file) =>
        `http://62.72.32.44:8000/${uploadDirectory}/${file.filename
          .split(" ")
          .join("-")}`
    );

    // Directory where the files are stored
    const directoryPath = path.join(fileUrl, `uploads/${uploadDirectory}`);

    // Rename files by replacing spaces with hyphens
    fsExtra.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }
      files.forEach((file) => {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

        // Rename each file
        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

    // Assign the first file URL to the fileUrl variable
    if (req.body[fieldName]) {
      fileUrl = req.body[fieldName][0];
    }
  }

  console.log(fileUrl);

  return fileUrl;
};
