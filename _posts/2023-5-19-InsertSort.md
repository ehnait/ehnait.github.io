---
title: '插入排序'
excerpt: ""
categories:
  - 算法与数据结构
tags:
  - 插入排序
---

```java
   public class InsertSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        int currentValue;
        for (int i = 0; i < nums.length - 1; i++) {
            int preIndex = i;
            currentValue = nums[preIndex + 1];
            System.out.println("待排序元素索引:" + (i + 1) + " 值为:" + currentValue + ",已经被排序数组的索引: " + preIndex);
            /*在已被排序过的数据中倒序寻找合适的位置,如果当前待排序数据比比较的数据小,讲比较的数据的元素后移一位*/
            while (preIndex >= 0 && currentValue < nums[preIndex]) {
                nums[preIndex + 1] = nums[preIndex];
                preIndex--;
                System.out.println(Arrays.toString(nums));
            }
            /*while循环结束时,说明已经找到了当前待排序数据的合适位置,插入*/
            nums[preIndex + 1] = currentValue;
            System.out.println("本轮被插入排序后的数组");
            System.out.println(Arrays.toString(nums));
            System.out.println("----------------------");

        }
        return nums;
    }
}
```
