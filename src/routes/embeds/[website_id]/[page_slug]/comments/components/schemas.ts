import * as v from 'valibot';

export const commentContentSchema = v.object({
	content: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(300)),
});
