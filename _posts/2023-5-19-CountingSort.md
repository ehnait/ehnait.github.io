---
title: '计数排序'
excerpt: ""
categories:
  - 算法与数据结构
tags:
  - 计数排序
---

```java
public class CountingSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        /*寻找数组中最大值和最小值,
         * bias:偏移量，用来定位 原始数组 每个元素在 计数数组 中的下标位置*/
        int bias, min = nums[0], max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            max = Math.max(nums[i], max);
            min = Math.min(nums[i], min);
        }
        bias = -min;
        /*初始化计数数组  (max-min+1) 为容量大小*/
        int[] counterArray = new int[max - min + 1];
        /*遍历整个原始数组，将原始数组中每个元素值转化为计数数组下标,并将计数数组下标对应的元素值大小进行累加*/
        for (int i = 0; i < nums.length; i++) {
            counterArray[nums[i] + bias]++;
        }
        System.out.println("计数数组为：" + Arrays.toString(counterArray) + " 最大值为：" + max + "  最小值为：" + min);
        System.out.println("===========================");

        int i = 0;/*访问原始数组时的下标计数器*/
        int j = 0;/*访问计数数组时的下标计数器*/
        /*访问计数数组，将计数数组中的元素进行转换后，重新写入到原始数组*/

        while (i < nums.length) {
            /*只要计数数组当前下标元素的值不为0,就将计数数组中的元素转换后，重新写回原始数组*/
            if (counterArray[j] != 0) {
                nums[i] = j - bias;
                counterArray[j]--;
                i++;
            } else {
                j++;
            }
            System.out.println(Arrays.toString(counterArray));
            System.out.println(Arrays.toString(nums));
            System.out.println("-----------------------");
        }
        return nums;
    }
}
```
