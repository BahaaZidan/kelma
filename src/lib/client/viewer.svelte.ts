import { getContext, setContext } from 'svelte';

import type { QueryResult, ViewerQuery$result } from '$houdini';

type Viewer = NonNullable<QueryResult<ViewerQuery$result, null>['data']>['viewer'] | undefined;

const key = {};

export function setViewerContext(viewerGetter: () => Viewer) {
	setContext(key, viewerGetter());
}

export function getViewerContext() {
	return getContext(key) as Viewer;
}
