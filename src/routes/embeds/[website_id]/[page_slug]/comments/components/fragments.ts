import { graphql } from '$houdini';

export const is_page_closed = graphql(`
	fragment IsPageClosed on Page {
		closed
	}
`);

export const website_owner = graphql(`
	fragment WebsiteOwner on Website {
		owner {
			id
		}
	}
`);
