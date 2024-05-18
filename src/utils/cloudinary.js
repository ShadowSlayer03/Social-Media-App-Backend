import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv"
import fs from "fs"

dotenv.config();
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(filePath)=>{
    try {
        if (!filePath) return null;

        const response = await cloudinary.uploader.upload(filePath,{
                resource_type: "auto"
        });
        console.log("File uploaded on cloudinary successfully!",response.url);
        fs.unlinkSync(filePath);
        return response;
        }
    catch (error) 
        {
            fs.unlinkSync(filePath); //removes the locally saved temp file  
            console.log("Error Uploading the File on Cloudinary. Please Try Again!",error);
        }
}

// const deleteOldImageFromCloudinary = async(imageURL)=>{
//     const publicIDMatch = imageURL.match(
//         /\/([\w-]+)\.[^.]*$/ // Regular expression for valid public IDs
//       );
//     const publicID = publicIDMatch?.[1];
//     console.log("Public ID:",publicID);

//     if(!publicID){
//         throw new Error("Invalid image URL: Could not extract Public ID.");
//     }

//     await cloudinary.uploader.destroy(publicID)
//     .then(result => {
//         console.log('File deleted successfully:', result);
//     })
//     .catch(error => {
//         console.error('Error deleting file:', error);
//     });
// }

const deleteFromCloudinary = async (imageURL) => {
    const publicIDMatch = imageURL.match(
        /\/([\w-]+)\.[^.]*$/ // Regular expression for valid public IDs
    );

    const publicID = publicIDMatch?.[1];
    console.log("Public ID:", publicID);

    if (!publicID) {
        throw new Error("Invalid image URL: Could not extract Public ID.");
    }

    try {
        const result = await cloudinary.uploader.destroy(publicID);
        console.log('File deleted successfully:', result);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

export {uploadOnCloudinary, deleteFromCloudinary}
