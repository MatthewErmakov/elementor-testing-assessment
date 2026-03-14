import type { AppSettings } from "./domain";

declare global {
    interface WpMediaAttachment {
        id: number;
        url?: string;
        sizes?: {
            thumbnail?: {
                url?: string;
            };
        };
    }

    interface WpMediaSelectionItem {
        toJSON: () => WpMediaAttachment;
    }

    interface WpMediaSelection {
        first: () => WpMediaSelectionItem | undefined;
    }

    interface WpMediaState {
        get: (key: string) => WpMediaSelection;
    }

    interface WpMediaFrame {
        on: (event: "select", callback: () => void) => void;
        state: () => WpMediaState;
        open: () => void;
    }

    interface Window {
        HELLO_EL_CHILD?: AppSettings;
        wp?: {
            media?: (options: {
                title?: string;
                button?: { text?: string };
                library?: { type?: string };
                multiple?: boolean;
            }) => WpMediaFrame;
        };
    }
}

declare module "*.module.css" {
    const classes: Record<string, string>;
    export default classes;
}

export {};
