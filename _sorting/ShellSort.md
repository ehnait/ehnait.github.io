---
title: '希尔排序'
excerpt : ""
---
```java
public class ShellSort {
    public static int[] sortArray(int[] nums) {
        int len = nums.length;
        /*按增量分组后，每个分组中，temp代表当前待排序的数据，该元素之前的组内元素均已被排序过*/
        /*grp指用来分组的增量，会依次递减*/
        int currentValue, grp = len / 2;
        while (grp > 0) {
            for (int i = grp; i < len; i++) {
                currentValue = nums[i];
                /*组内已被排序数据的索引*/
                int preIndex = i - grp;
                /*在组内已被排序过数据中倒序寻找合适的位置，如果当前待排序数据比比较的元素要小，则将比较元素在组内后移一位*/
                while (preIndex >= 0 && nums[preIndex] > currentValue) {
                    nums[preIndex + grp] = nums[preIndex];
                    preIndex -= grp;
                }
                /*while循环结束时，说明已经找到了当前待排序数据的合适位置，插入*/
                nums[preIndex + grp] = currentValue;
            }
            System.out.println("本轮增量" + "[" + grp + "]" + "排序后的数组");
            System.out.println(Arrays.toString(nums));
            System.out.println("-----------------------------------");
            grp /= 2;
        }
        return nums;
    }
}
```
