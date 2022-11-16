---
title: '快速排序'
excerpt : ""
---
```java
public class QuickSort {
    public static void sortArray(int[] nums) {
        sort(nums, 0, nums.length - 1);
        System.out.println(Arrays.toString(nums));
    }

    private static void sort(int[] nums, int low, int high) {
        if (low >= high) return;
        int left = low;
        int right = high;
        int pivot = nums[low];
        while (left < right) {
            while (left < right && nums[right] >= pivot) {
                right--;
            }
            while (left < right && nums[left] <= pivot) {
                left++;
            }
            if (left < right) {
                int temp = nums[left];
                nums[left] = nums[right];
                nums[right] = temp;
            }
        }

        //left==right
        nums[low] = nums[left];
        nums[left] = pivot;

        sort(nums, low, left - 1);
        sort(nums, left + 1, high);
    }
}
```
