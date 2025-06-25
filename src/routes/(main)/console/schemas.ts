import * as v from 'valibot';

export const baseInfoSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(50)),
	// TODO: decent domain validation
	domains: v.array(v.pipe(v.string(), v.trim())),
});
