---
layout: ../../../../layouts/Post.astro
title: 'Advent of Code 2023: Day 2'
pubDate: 2023-12-02T00:00:00-7
description: 'Breaking down the puzzle and my solution, in Kotlin. Spoilers.'
author: 'Scott Odle'
tags: ['advent of code', 'advent of code 2023', 'kotlin']
---

---

**_I'm about to break down my solution for Day 2. Spoilers ahead!_**

---
Day 2 code: https://github.com/sodle/aoc2023/blob/main/src/main/kotlin/Day02.kt 

# Reading the input

The input is a bit more complicated today than it was yesterday. Each line of input represents a "game", where our elf friend will reach into his bag and pull out several handfuls of gems. For example:
```
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
```

We're interested in the ID of the game, in this case `1`. We're also interested in the number of red, green, and blue gems in each handful. In this case, for blue gems, we've got a handful with 3 and a handful with 6.

We can use Regular Expressions (RegEx) to extract these values. After some cleanup, I came up with a regex that matches the game ID, and regexes that match a handful of red, green, or blue gems.
```kotlin
val gameIdRegex = "Game (\\d+)".toRegex()
val redRegex = "(\\d+) red".toRegex()
val greenRegex = "(\\d+) green".toRegex()
val blueRegex = "(\\d+) blue".toRegex()
```
See the bits in parentheses, such as `(\\d+)`? These are "capture groups", which signal to the regex processor that we're interested in this part of the string specificially. In this case, the `\d+` matches a sequence of one or more digits, which will be our game ID or one of our gem counts.

The game ID only appears once in each string, so we can extract it and store it as a single Int. The gem counts, however, can appear many times. So we'll want to generate a list for each color, containing the number of matching gems in each handful.

This means that we're extracting four pieces of data from each line, and three of those are lists. Let's build a new type of object to keep this organized.
```kotlin
class Game(gameString: string) {
    val id: Int = 0
    val red: List<Int> = listOf()
    val green: List<Int> = listOf()
    val blue: List<Int> = listOf()
}
```
The Input Type for this puzzle is going to be a list of Game objects, instead of a primitive type like a string.

We used placeholder values earlier when we defined our class - now let's use our regexes to process the string and get the real values.
```kotlin
class Game(gameString: String) {
    val id = gameIdRegex.find(gameString)!!.destructured.component1().toInt()

    val blue = blueRegex.findAll(gameString).map {
        it.destructured.component1().toInt()
    }.toList()
    val green = greenRegex.findAll(gameString).map {
        it.destructured.component1().toInt()
    }.toList()
    val red = redRegex.findAll(gameString).map {
        it.destructured.component1().toInt()
    }.toList()
}
```
For extracting the ID, since there's only one of those, we use the `find` method of our regex. `find` returns a match if it found one, but returns `null` if not. We can use the `!!` operator to assert that this value is not null. This will cause our program to crash if we do hit a null, but since we know that all of our games have an ID, we can be confident that this won't happen. Once we have a match, we call `destructured.component1()`, which gets us the first "capture group" that our regex found. That value comes in as a string, so finally we call `toInt()` to turn it into a number.

The gem counts are a bit more complicated, since we're looking for an array. Instead of `find`, we'll call `findAll` to find _every_ match in the string. We'll map over each one, once again getting the value of each capture group. This leaves us with a `Sequence` of integers, but we'll call `toList` because lists are a bit easier to work with.

# Part 1
Part 1 asks us to look at each game, and determine if it would be possible under certain constraints. Particularly, we're looking for games that are valid when there are only 12 red, 13 green, and 14 blue cubes in the bag. Our final answer is the sum of the IDs of those lines.

## A false start
Just like with part 2 yesterday, I went about this wrong at first. In my first attempt, I took the _sum_ of the handfuls of each color gem, and compared those to the constraints:
```kotlin
override fun part1(input: List<Game>): Int {
    return input.filter {
        it.red.sum() <= 12 && it.green.sum() <= 13 && it.blue.sum() <= 14
    }.sumOf { it.id }
}
```
This actually worked for the test input, but failed for the real puzzle input. So what went wrong?

## Putting the gems back in the bag
What I failed to notice, is that the elf puts the gems back into the bag after each round. So we don't actually care about the total number of gems, we just have to make sure that no single handful of gems contains more than the constraint. This is the max, not the sum.
```kotlin
override fun part1(input: List<Game>): Int {
    return input.filter {
        it.red.max() <= 12 && it.green.max() <= 13 && it.blue.max() <= 14
    }.sumOf { it.id }
}
```
This gets us our correct answer (which is much larger than the incorrect answer we had before, because the constraint is a lot looser).

# Part 2
Part 2 is asking, for each game, how many of each cube must be in the bag to make it possible? This is really just the inverse of part 1, so we can reuse much of that logic (we just need the max value for each color). It then asks us to multiply the color values together for each game, and sum up the products for each game.
```kotlin
override fun part2(input: List<Game>): Int {
    return input.sumOf {
        it.red.max() * it.blue.max() * it.green.max()
    }
}
```
Straightforward enough, and it gets us our correct final answer!

---

**_See you tomorrow for Day 3!_**
