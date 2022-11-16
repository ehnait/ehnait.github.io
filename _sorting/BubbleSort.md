---
title: '冒泡排序'
excerpt : ""
---
```java
 public class BubbleSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        for (int i = 0; i < nums.length; i++) {
            // [nums.length - 1 - i ]  最后一个数据已经排序完了
            for (int j = 0; j < nums.length - 1 - i; j++) {
                if (nums[j] > nums[j + 1]) {
                    int temp = nums[j + 1];
                    nums[j + 1] = nums[j];
                    nums[j] = temp;
                }
                System.out.println(Arrays.toString(nums));
            }
            System.out.println("----------------------------------");
        }
        return nums;
    }
}
```
