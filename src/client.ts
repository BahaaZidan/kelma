import { BETTER_AUTH_URL } from '$env/static/private';
import { HoudiniClient } from '$houdini';

export default new HoudiniClient({
	url: `${BETTER_AUTH_URL}/api/graphql`,

	// uncomment this to configure the network call (for things like authentication)
	// for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
	// fetchParams({ session }) {
	//     return {
	//         headers: {
	//             Authorization: `Bearer ${session.token}`,
	//         }
	//     }
	// }
});
