---
layout: ../../../../layouts/Post.astro
title: 'Advent of Code 2023: Day 3'
pubDate: 2023-12-03T00:00:00-7
description: 'Breaking down the puzzle and my solution, in Kotlin. Spoilers.'
author: 'Scott Odle'
tags: ['advent of code', 'advent of code 2023', 'kotlin']
---

---

**_I'm about to break down my solution for Day 3. Spoilers ahead!_**

---
Day 3 code: https://github.com/sodle/aoc2023/blob/main/src/main/kotlin/Day03.kt 

# Reading the input

Today's puzzle input is a "schematic", represented as a 2-dimensional grid of characters.

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
