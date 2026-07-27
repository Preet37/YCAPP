import { embed, generateObject } from "ai";
import { z } from "zod";
import { catalogPromptList } from "./event-catalog";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const VISION_MODEL = "anthropic/claude-sonnet-5";

export async function embedProfile(buildingText: string, lookingForText: string) {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: `Building: ${buildingText}\nLooking for: ${lookingForText}`,
  });
  return embedding;
}

const verificationSchema = z.object({
  isValidCredential: z
    .boolean()
    .describe(
      "True only if the image is a photo of a YC Startup School 2026 badge, ticket, or personalized YC Agent schedule screenshot."
    ),
  nameOnCredential: z
    .string()
    .nullable()
    .describe("The attendee name printed on the badge/schedule, if visible."),
  nameMatchesClaim: z
    .boolean()
    .nullable()
    .describe(
      "True if the name on the credential plausibly refers to the claimed user, allowing for nicknames, middle names, initials, and different orderings. False if it clearly belongs to someone else. Null if no name is visible on the credential."
    ),
  sessionSlugs: z
    .array(z.string())
    .describe(
      "Slugs from the provided Startup School program that appear on this schedule. Use only slugs from that list; omit anything you cannot confidently map."
    ),
  reason: z
    .string()
    .describe("Brief reason for the isValidCredential verdict."),
});

export type VerificationResult = z.infer<typeof verificationSchema>;

export async function verifyCredential(
  imageBytes: Buffer,
  mediaType: string,
  claimedName: string
): Promise<VerificationResult> {
  const { object } = await generateObject({
    model: VISION_MODEL,
    schema: verificationSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `The user claims their name is "${claimedName}" and this image is their YC Startup School 2026 badge, ticket, or personal YC Agent schedule screenshot. Verify this looks like a real Startup School credential (not an unrelated photo), extract the name printed on it if visible, and judge whether that name belongs to the claimed user. Badges and schedules are frequently shared in group chats, so a credential printed with a clearly different person's name must not pass as the claimed user's own.

Then map every session on the schedule onto this official Startup School 2026 program. Return only the matching slugs, and skip anything you cannot confidently match (meals, transitions, and arrivals have no slug):

${catalogPromptList()}`,
          },
          {
            type: "image",
            image: imageBytes,
            mediaType,
          },
        ],
      },
    ],
  });

  return object;
}
