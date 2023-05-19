---
title: '堆排序'
excerpt: ""
categories:
  - 算法与数据结构
tags:
  - 堆排序
---

```java

public class HeapSort {
    //声明全局变量，用于记录数组Array的长度
    private static int len;

    public static int[] sortArray(int[] nums) {
        len = nums.length;
        if (len < 1) return nums;
        /*1.构建一个最大堆*/
        buildMaxHeap(nums);
        /*2.循环将堆首位(最大值)与未排序数据末位交换，然后重新调整最大堆*/
        while (len > 0) {
            swap(nums, 0, len - 1);
            len--;
            adjustHeap(nums, 0);
            System.out.println(Arrays.toString(nums));
            System.out.println("-------------------");
        }
        return nums;
    }

    private static void buildMaxHeap(int[] nums) {
        /*从最后一个非叶子节点开始向上构建最大堆*/
        /* 对于完全二叉树： 最后一个非叶子节点的位置为  (n/2)-1, n为数组长度  */
        for (int i = len / 2 - 1; i > 0; i--) {
            adjustHeap(nums, i);
        }
        System.out.println("构造完成最大堆");
        System.out.println(Arrays.toString(nums));
        System.out.println("====================");
    }

    private static void adjustHeap(int[] array, int i) {
        int maxIndex = i;
        /*  对于完全二叉树：左子节点位置= 2*k+1  , 右子节点位置= 2*(k+1)  */
        int left = 2 * i + 1;
        int right = 2 * (i + 1);

        /*  如果有左子树,且左子树大于父节点,则将最大指针指向左子树  */
        if (left < len && array[left] > array[maxIndex]) {
            maxIndex = left;
        }
        /*  如果有右子树,且右子树大于父节点且大于左子树,则将最大指针指向右子树  */
        if (right < len && array[right] > array[maxIndex] && array[right] > array[left]) {
            maxIndex = right;
        }
        if (maxIndex != i) {
            swap(array, maxIndex, i);
            System.out.println(Arrays.toString(array));
            //因为有数据交换，所以继续递归调整
            adjustHeap(array, maxIndex);
        }
    }


    private static void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```
