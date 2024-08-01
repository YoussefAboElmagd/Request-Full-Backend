import mongoose from "mongoose";

const dbConnection = () => {
  const connectionString = "mongodb+srv://abdelrahmanmohammed851:boda12345@cluster0.o9chdll.mongodb.net/Request";


  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((conn) =>
      console.log(`Database successfully connected on ${connectionString}`)
    )
    .catch((err) => console.error(`Database connection error: ${err.message}`));
};

export default dbConnection;
