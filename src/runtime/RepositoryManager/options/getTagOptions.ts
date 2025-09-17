import { gitTag, TagOptions } from "../git/commands/gitTag";
import { formatArgs, showCommandBuilder } from "./utils";

type TagOtherOptions = {
	push: boolean;
};

export const getTagOptions = async (
	commitOrObject: string,
	initialValue?: Partial<TagOptions & TagOtherOptions>,
) => {
	const result = await showCommandBuilder({
		getPlaceholder: (o) => formatArgs(gitTag(commitOrObject, o)),
		initialValue,
		items: {
			name: {
				label: "<tagname>",
				type: "input",
			},
			annotate: {
				label: "--annotate",
				radioGroup: "annotate",
				type: "flag",
				description: "Create annotated tag",
			},
			force: {
				label: "--force",
				type: "flag",
				description: "Replace existing tag (instead of failing)",
			},
			message: {
				label: "--message <message>",
				radioGroup: "annotate",
				type: "input",
				description: "Add message to an annotated tag, implies (--annotate)",
			},
			edit: {
				label: "--edit",
				type: "flag",
				description: "Edit message before creating tag",
			},
			push: {
				label: "Push tag to remotes",
				type: "other",
				detail: "Use `git push` to push the tag to remotes.",
			},
		},
	});

	return result;
};
