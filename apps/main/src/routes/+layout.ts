import { load_ViewerQuery } from '$houdini';

import type { LayoutLoad } from './$houdini';

export const load: LayoutLoad = async (event) => {
	return {
		...(await load_ViewerQuery({ event })),
	};
};
