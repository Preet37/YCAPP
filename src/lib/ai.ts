import { embed, generateObject } from "ai";
import { z } from "zod";

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
  sessions: z
    .array(
      z.object({
        name: z.string().describe("Session or speaker name, e.g. 'Jeff Dean Keynote'"),
        type: z
          .enum(["keynote", "breakout", "partner_meeting", "expo", "other"])
          .describe("Best-guess category of the session."),
      })
    )
    .describe("All sessions/events listed on the schedule, if this is a schedule screenshot."),
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
            text: `The user claims their name is "${claimedName}" and this image is their YC Startup School 2026 badge, ticket, or personal YC Agent schedule screenshot. Verify this looks like a real Startup School credential (not an unrelated photo), extract the name printed on it if visible, and extract any session names listed.`,
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
