import {apiUrl} from "./config.js";
import {handleApiError} from "./errorHandler.js";

export default function getUserTagsApi(userId) {
    return fetch(`${apiUrl}/user/tags/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userToken'))}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                console.log('Error fetching user tags:', response.status, response.statusText,response.body);
            }
            return response.json();
        }).catch(error => {
            handleApiError(error);
        });
}