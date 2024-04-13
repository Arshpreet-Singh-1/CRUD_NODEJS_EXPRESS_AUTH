// Import the express module
const express = require('express');

// Create a router instance using express Router
const router = express.Router();

// Initialize a sample friends object with email IDs as keys
let friends = {
    "johnsmith@gamil.com": {"firstName": "John","lastName": "Doe","age":22},
    "annasmith@gamil.com":{"firstName": "Anna","lastName": "smith","age":23},
    "peterjones@gamil.com":{"firstName": "Peter","lastName": "Jones","age":24}
};

// GET request: Retrieve all friends
router.get("/",(req,res)=>{
    res.send(friends);
});

// GET by specific ID request: Retrieve a single friend with email ID
router.get('/:email',function (req, res) {
    const email = req.params.email;
    res.send(friends[email]);
});

// POST request: Add a new friend
router.post("/",function (req,res){
    if (req.body.email){
        // Extract friend details from request body
        const { firstName, lastName, age } = req.body;
        // Add the new friend to the friends object
        friends[req.body.email] = {
            "firstName": firstName,
            "lastName": lastName,
            "age": age
        };
        // Send a success message
        res.send(`The user ${firstName} has been added!`);
    } else {
        // Send an error message if email is missing in request body
        res.status(400).send("Email is required.");
    }
});

// PUT request: Update the details of a friend with email id
router.put("/:email", function (req, res) {
    const email = req.params.email;
    let friend = friends[email]
    if (friend) { // Check if friend exists
        // Update friend details if provided in request body
        if(req.body.firstName){
            friend.firstName = req.body.firstName;
        }
        if(req.body.lastName){
            friend.lastName = req.body.lastName;
        }
        if(req.body.age){
            friend.age = req.body.age;
        }
        // Update friend in the friends object
        friends[email] = friend;
        res.send(`Friend with the email ${email} updated.`);
    } else {
        // Send an error message if friend does not exist
        res.status(404).send("Unable to find friend!");
    }
});

// DELETE request: Delete a friend by email id
router.delete("/:email", (req, res) => {
    const email = req.params.email;
    // Check if email is provided
    if (email){
        // Delete the friend from the friends object
        delete friends[email];
        // Send a success message
        res.send(`Friend with the email ${email} deleted.`);
    } else {
        // Send an error message if email is missing
        res.status(400).send("Email is required.");
    }
});

// Export the router to be used by the main application
module.exports=router;
