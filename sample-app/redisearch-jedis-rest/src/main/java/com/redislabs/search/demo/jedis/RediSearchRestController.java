package com.redislabs.search.demo.jedis;

import io.redisearch.SearchResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.util.Map;

@Slf4j
@CrossOrigin(origins = "*")
@RequestMapping("/api/1.0/")
@RestController
public class RediSearchRestController {

    @Inject RediSearchService rediSearchService;


    @GetMapping("/status")
    public String status() {
        return "OK";
    }


    @GetMapping("/search")
    public Map<String,Object> search(
            @RequestParam(name="q")String query,
            @RequestParam(name="offset", defaultValue="0")int offset,
            @RequestParam(name="limit", defaultValue="10")int limit,
            @RequestParam(name="sortby", defaultValue="")String sortBy,
            @RequestParam(name="ascending", defaultValue="true")boolean ascending) {
        return rediSearchService.search(query, offset, limit, sortBy,ascending);
    }


    @GetMapping("/search_with_command")
    public Map<String,Object> searchWithJedisCommand(
            @RequestParam(name="q")String query,
            @RequestParam(name="offset", defaultValue="0")int offset,
            @RequestParam(name="limit", defaultValue="10")int limit,
            @RequestParam(name="sortby", defaultValue="")String sortBy,
            @RequestParam(name="ascending", defaultValue="true")boolean ascending) {
        return rediSearchService.searchWithJedisCommand(query, offset, limit, sortBy, ascending);
    }


}
