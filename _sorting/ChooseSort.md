---
title: '选择排序'
excerpt : ""
---
```java
  public class ChooseSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length == 0) return nums;
        for (int i = 0; i < nums.length; i++) {
            int minIndex = i;//最小值下标
            for (int j = i; j < nums.length; j++) {
                if (nums[j] < nums[minIndex]) {
                    minIndex = j;
                }
            }

            System.out.println("最小数为:" + nums[minIndex]);

            int temp = nums[i];
            nums[i] = nums[minIndex];
            nums[minIndex] = temp;
            System.out.println(Arrays.toString(nums));
            System.out.println("---------------------------");
        }
        return nums;
    }
}
```
