I've installed ndk.

Let's switch over from using the current login system to using NDK signer.

The following is from the NDK docs, please disable (but don't uninstall) the nostr-tools login approach and replace it with NDK in the appropriate place

// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://localhost:3334"],
});
// Now connect to specified relays
await ndk.connect();

