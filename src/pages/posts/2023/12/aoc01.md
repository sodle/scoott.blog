---
layout: ../../../../layouts/Post.astro
title: 'Advent of Code 2023: Day 1'
pubDate: 2023-12-01T00:00:00-7
description: 'Breaking down the puzzle and my solution, in Kotlin. Spoilers.'
author: 'Scott Odle'
tags: ['advent of code', 'advent of code 2023', 'kotlin']
---

It's that time of year again! 

This year, I'll be attempting the Advent of Code in Kotlin. This is a new language for me: Python is my default, and I attempted 2021 in Golang before ultimately switching back to Python.

I chose Kotlin because of its beautiful syntax for higher-order functions (`map`, `forEach`, `filter`, etc.). I find that most AoC problems boil down to processing a huge list, so those functions might be quite helpful. I certainly missed them when I used Go.

---

# Code Structure
Since this is Day 1, I'll walk you through the repo I've built. You can check out the code [here](https://github.com/sodle/aoc2023).

## BasePuzzle
All the solution code lives in `src/main/kotlin`. Here, I've built a base class, in `BasePuzzle.kt`. This class provides:
- A way to easily define the input and output types for a puzzle. By using generic types here, we can handle a case where one day uses different input and output types from the next, or a case where two parts of the same day output different types of data.
- A helper function, `readLines`, for reading puzzle input from a file. The input comes from text files in the `resources` directory, allowing us to easily inject different input for test cases and real solutions.
- A `main` function, which grabs the input, runs both parts of the puzzle, and outputs them in a pretty way.

Each day's puzzle gets its own class file, which extends `BasePuzzle`. These child classes are responsible for defining the input and output types, and implementing the methods for processing input and calculating the puzzle solution. 

Each child class also has a companion object, with a `main` function, so you can run the code in IntelliJ IDEA with just one click.
```kotlin
companion object {
    @JvmStatic fun main(args: Array<String>) {
        val dayClass = this::class.java.declaringClass.getDeclaredConstructor()
        val day = dayClass.newInstance() as BasePuzzle<*, *, *>
        day.main()
    }
}
```

This `main` function remains the same for every puzzle, so it can be copy/pasted every day without modification. It simply finds the class that the companion object is attached to, creates a new instance, and calls the class's main function. 

## Tests

Tests are defined in JUnit 5, in `src/test/kotlin`. There's not much interesting to say about them, other than that the the `test` directory has its own `resources` directory. This allows us to use different input when testing instead of running the solution.

---

**_Now to get to the actual solution for Day 1. Spoilers ahead!_**

---
Day 1 code: https://github.com/sodle/aoc2023/blob/main/src/main/kotlin/Day01.kt 

# Reading the input

The input here is pretty straightforward. We're interested in each individual line from the input file, which `readLines` already gives us. We just need to filter out blank lines, in case there's one at the end of the file or something. 
```kotlin
override fun getPuzzleInput(): List<String> {
    return readLines("day01.txt").filter { it.isNotBlank() }
}
```

In this case, our Input Type is a list of strings.

# Part 1
Part 1 asks us to find the first and last digits (1 through 9) in each line. These can be the same digit, as in the fourth example: `treb7uchet` only contains a single 7, so that is both our first and last digit. Then we need to combine those digits in to a two-digit number for each line, and sum them all up.

```kotlin
override fun part1(input: List<String>): Int {
    return input.map { line ->
        line.filter { it.isDigit() }
    }.map { line ->
        line.first().toString() + line.last().toString()
    }.sumOf { line ->
        line.toInt()
    }
}
```

Kotlin's iteration features are already coming in handy here. First off, we map over each line, filtering its characters down to only the digits. For the example input:
- `1abc2` becomes `12`
- `pqr3stu8vwx` becomes `38`
- `a1b2c3d4e5f` becomes `12345`
- `treb7uchet` becomes `7`

Next, we map again to get the start and end of each line, and concatenate them together into a string:
- `12` remains `12`
- `38` remains `38`
- `12345` becomes `15`, filtering out all the middle digits
- `7` becomes `77`, because that lone 7 is both the first and last digit

Finally, we use `sumOf` to convert these strings into integers, and add them all together to get our final result. `sumOf` combines both `map` and `sum` into one convenient method.

# Part 2
Honestly, this is the trickiest Day 1 Part 2 puzzle I think I've ever seen. Some of the digits are spelled out, instead of written as digits. We now have to consider them, as well.

For my first attempt, I tried a rather messy find-and-replace to turn words into digits. Then, I reused the Part 1 code to do the actual calculation:
```kotlin
override fun part2(input: List<String>): Int {
    val parsedInput = input.map {
        it.replace("one", "1")
            .replace("two", "2")
            .replace("three", "3")
            .replace("four", "4")
            .replace("five", "5")
            .replace("six", "6")
            .replace("seven", "7")
            .replace("eight", "8")
            .replace("nine", "9")
    }
    return part1(parsedInput)
}
```
For the new test input:
- `two1nine` becomes `219`
- `eightwothree` becomes `eigh23`
- `abcone2threexyz` becomes `abc123xyz`
- `xtwone3four` becomes `xtw123`
- `4nineeightseven2` becomes `49872`
- `zoneight234` becomes `z1ight234`
- `7pqrstsixteen` becomes `7pqrst6teen`

Wait, that's not right. Look at how we handle `eightwo` in the second input, and `twone` in the fourth. In both these cases, two digits share a letter, so only one can be converted. The find-and-replace is giving lower digits precedence over higher ones, so we favor the `two` in one case and the `one` in the other. But is that correct? No, the puzzle input is looking for the _first_ and _last_ digit in each line, regardless of its value.

# Back to the drawing board
For our second attempt, we need to read the string in the proper order, stopping when we hit either a digit, or the name of a digit.

For the first digit, we want to check if the beginning of the line is a valid digit, and return it if so. Otherwise, we want to chop characters off of the beginning of the string, one at a time, until we find a digit.

We can boil the "check" down into a function, `findDigitName`. 
```kotlin
private fun findDigitName(input: String): Int {
    if (input.isBlank())
        return 0

    if (input.startsWith("one"))
        return 1
    if (input.startsWith("two"))
        return 2
    if (input.startsWith("three"))
        return 3
    if (input.startsWith("four"))
        return 4
    if (input.startsWith("five"))
        return 5
    if (input.startsWith("six"))
        return 6
    if (input.startsWith("seven"))
        return 7
    if (input.startsWith("eight"))
        return 8
    if (input.startsWith("nine"))
        return 9

    if (input.first().isDigit())
        return input.first().digitToInt()

    return 0
}
```

- If the string is empty, we return `0`. There are no zeroes in the puzzle input, so we can safely use that value to mean "we didn't find anything".
- If the string starts with any of the names of the nine digits, we return that digit.
- If the string starts with a digit, we return it (converted to an integer)
- Otherwise, we return `0` because we didn't find anything.

For checking the first digit, we can iterate like so:
```kotlin
for (i in it.indices) {
    firstDigit = findDigitName(it.substring(i))
    if (firstDigit > 0) {
        break
    }
}
```

This looks at each index in the string, and evaluates it as if no characters before that index existed. Once it finds a substring that starts with a digit, it grabs that digit and stops iterating. For the third sample input, `abcone2threexyz`, it looks like this:
- `abcone2threexyz`: no digit found, continue
- `bcone2threexyz`: none found, continue
- `cone2threexyz`: none found, continue
- `one2threexyz`: found `one`, so the first digit is `1`, and we can stop searching

For finding the last digit, we just have to read backwards:
```kotlin
for (i in it.indices.reversed()) {
    lastDigit = findDigitName(it.substring(i))
    if (lastDigit > 0) {
        break
    }
}
```

Now that we have the first and last digits, we just have to turn them into a number. I realized at this point that we can do this mathematically, instead of with string concatenation.
```kotlin
firstDigit * 10 + lastDigit
```

All of this logic is wrapped in a `sumOf`, which gets us the correct final result!

---

**_See you tomorrow for Day 2!_**
