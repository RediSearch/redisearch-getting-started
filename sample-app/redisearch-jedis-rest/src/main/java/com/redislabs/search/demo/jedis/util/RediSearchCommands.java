package com.redislabs.search.demo.jedis.util;

import redis.clients.jedis.commands.ProtocolCommand;
import redis.clients.jedis.util.SafeEncoder;

/**
 * This class is obviously not necessary when you are using JRediSearch
 *
 * This is just to demonstrate how to use RediSearch using Jedis only
 *
 * The first thing to do is to add new commands.
 */
public class RediSearchCommands {

    public enum Command implements ProtocolCommand {
        SEARCH("FT.SEARCH");

        private final byte[] raw;

        Command(String alt) {
            raw = SafeEncoder.encode(alt);
        }

        @Override
        public byte[] getRaw() {
            return raw;
        }
    }
}
