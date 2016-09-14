# cryptpad-amnesia-store

An in-memory datastore for Cryptpad.

## Status

Unsupported.

## Why?

AmnesiaDB offers no persistence, and is mostly intended to be used for testing cryptpad.

## Install

npm install cryptpad-amnesia-store

## Configure

```
{
    storage: 'cryptpad-amnesia-store',

    /*
        This 'database' implements (limited) document expiration
        Cryptpad can be configured to destroy channels some number of milliseconds
        after the last user has disconnected
    */
    removeChannels: false,
    channelRemovalTimeout: 60000,
}
```

## License

Available under the AGPL-3.0.
