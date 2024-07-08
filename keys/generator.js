const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function genKeyPair() {
    try {
        const publicKeyPath = path.join(__dirname, "public.pem");
        const privateKeyPath = path.join(__dirname, "private.pem");

        if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
            console.log("RSA key pair already exists.");
            return;
        }

        const keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: "pkcs1",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs1",
                format: "pem",
            },
        });

        fs.writeFileSync(publicKeyPath, keyPair.publicKey);
        fs.writeFileSync(privateKeyPath, keyPair.privateKey);

        console.log("RSA key pair generated successfully.");
    } catch (error) {
        console.error("Error generating RSA key pair:", error.message);
    }
}

genKeyPair();
