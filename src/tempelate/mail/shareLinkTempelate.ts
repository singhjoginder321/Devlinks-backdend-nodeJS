const shareLinkTemplate = (name: string, email: string, profilePicture: string, links: { platform: string, link: string }[]): string => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>User Details</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .profile {
                display: flex;
                align-items: center;
                border-bottom: 2px solid #eaeaea;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .profile img {
                border-radius: 50%;
                width: 100px;
                height: 100px;
                margin-right: 20px;
                border: 2px solid #ddd;
            }
            .profile-details h2 {
                margin: 0;
                font-size: 24px;
                color: #333;
            }
            .profile-details p {
                margin: 5px 0 0;
                font-size: 16px;
                color: #777;
            }
            .links {
                margin-top: 20px;
            }
            .links h3 {
                font-size: 18px;
                margin-bottom: 10px;
                color: #333;
            }
            .links a {
                display: block;
                margin: 8px 0;
                padding: 10px;
                border-radius: 4px;
                background-color: #e0f7fa;
                color: #00796b;
                text-decoration: none;
                font-size: 16px;
                transition: background-color 0.3s, color 0.3s;
            }
            .links a:hover {
                background-color: #b2dfdb;
                color: #004d40;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="profile">
                <img src="${profilePicture}" alt="Profile Picture">
                <div class="profile-details">
                    <h2>${name}</h2>
                    <p>Email: ${email}</p>
                </div>
            </div>
            <div class="links">
                <h3>Links:</h3>
                ${links.map(link => `<a href="${link.link}" target="_blank" rel="noopener noreferrer">${link.platform}</a>`).join('')}
            </div>
        </div>
    </body>
    </html>
  `;
};

// Export the function using ES module syntax
export default shareLinkTemplate;
