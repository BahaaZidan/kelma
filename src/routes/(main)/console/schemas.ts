import * as v from 'valibot';

export const baseInfoSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(50)),
	domains: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.trim(),
				v.minLength(4),
				v.regex(/^(localhost|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/)
			)
		),
		v.minLength(1)
	),
});
