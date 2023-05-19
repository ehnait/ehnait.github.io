---
title: 'Android水位动画'
excerpt: "Android自定义View实现水位波浪的动画效果"
categories: 
  - 移动端
tags:
  - Android
---

![gif](/assets/images/20180302_1.gif){: .align-center height="40%" width="40%"}

```java

public class LoadView extends View {

    //上下文对象
    private Context context;
    //屏幕宽
    private int mWindowWidth;
    //屏幕高
    private int mWindowHeight;
    //画笔
    private Paint paint;
    //图片
    private Bitmap bitmapBg;
    //矩形动画
    private ValueAnimator squareAnim;
    //水位动画
    private AnimatorSet waterAnim;
    //bitmap高度
    private int bitmapHight;
    //bitmap宽度
    private int bitmapWidth;
    //2D图形颜色渲染对象，取两层绘制交集，显示上层，矩形动画加载使用
    private PorterDuffXfermode xfermode_rect = new PorterDuffXfermode(PorterDuff.Mode.SRC_IN);
    //2D图形颜色渲染对象，取下层非交集部分与上层交集部分，水位动画加载使用
    private PorterDuffXfermode xfermode_water = new PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP);
    //默认水位波纹的颜色
    private final int DEFAULT_FRONT_WAVE_COLOR = Color.parseColor("#28f16d7a");
    //默认水位的颜色
    private final int DEFAULT_BEHIND_WAVE_COLOR = Color.parseColor("#3cf16d7a");
    //默认矩形加载颜色
    private final int DEFAULT_RECT_COLOR = Color.parseColor("#3cf16d7a");
    //绘制矩形的高度变化
    private float drawHight;
    //绘制水位的参数变化
    private Matrix mShaderMatrix;
    //水位背景
    private BitmapShader mWaveShader;
    //动画类型
    private ShapeType animatorType;

    private final float DEFAULT_AMPLITUDE_RATIO = 0.05f;
    private final float DEFAULT_WATER_LEVEL_RATIO = 0.5f;
    private final float DEFAULT_WAVE_LENGTH_RATIO = 1.0f;
    private final float DEFAULT_WAVE_SHIFT_RATIO = 0.0f;

    private float mAmplitudeRatio = DEFAULT_AMPLITUDE_RATIO;
    private float mWaveLengthRatio = DEFAULT_WAVE_LENGTH_RATIO;
    private float mWaterLevelRatio = DEFAULT_WATER_LEVEL_RATIO;
    private float mWaveShiftRatio = DEFAULT_WAVE_SHIFT_RATIO;

    private float mDefaultAmplitude;
    private float mDefaultWaterLevel;
    private float mDefaultWaveLength;
    private double mDefaultAngularFrequency;


    /**
     * 枚举类，动画类型
     */
    public enum ShapeType {
        //水位动画
        WATER,
        //矩形动画
        SQUARE
    }

    public LoadView(Context context) {
        this(context, null);
        this.context = context;
    }

    public LoadView(Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
        this.context = context;
    }

    public LoadView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;
    }

    /**
     * 设置显示图片和加载颜色
     */
    public void create(int resource, ShapeType animatorType) {
        if (this.animatorType == null) {
            this.animatorType = animatorType;
            //获取资源图片转化为bitmap
            bitmapBg = BitmapFactory.decodeResource(context.getResources(), resource);
            //获取图片宽度
            bitmapWidth = bitmapBg.getWidth();
            //获取图片高度
            bitmapHight = bitmapBg.getHeight();
            //初始化
            init();
        }
    }

    /**
     * 初始化
     */
    private void init() {
        DisplayMetrics dm = getResources().getDisplayMetrics();
        //获取屏幕宽度
        mWindowWidth = dm.widthPixels;
        //获取屏幕高度
        mWindowHeight = dm.heightPixels;
        //画笔
        paint = new Paint();
        paint.setAntiAlias(true);
        paint.setDither(true);
        mShaderMatrix = new Matrix();
        if (animatorType == ShapeType.WATER) {
            createShader();
        }
    }


    /**
     * 创建水位动画的波浪背景，并设置到画笔中
     */
    private void createShader() {

        mDefaultAngularFrequency = 2.0f * Math.PI / DEFAULT_WAVE_LENGTH_RATIO / bitmapWidth;
        mDefaultAmplitude = bitmapHight * DEFAULT_AMPLITUDE_RATIO;
        mDefaultWaterLevel = bitmapHight * DEFAULT_WATER_LEVEL_RATIO;
        mDefaultWaveLength = bitmapWidth;
        Bitmap bitmapLine = Bitmap.createBitmap(bitmapWidth, bitmapHight, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmapLine);
        Paint wavePaint = new Paint();
        wavePaint.setStrokeWidth(2);
        wavePaint.setAntiAlias(true);
        wavePaint.setDither(true);

        final int endX = bitmapWidth + 1;
        final int endY = bitmapHight + 1;

        float[] waveY = new float[endX];

        wavePaint.setColor(DEFAULT_FRONT_WAVE_COLOR);
        for (int beginX = 0; beginX < endX; beginX++) {
            double wx = beginX * mDefaultAngularFrequency;
            float beginY = (float) (mDefaultWaterLevel + mDefaultAmplitude * Math.sin(wx));
            canvas.drawLine(beginX, beginY, beginX, endY, wavePaint);

            waveY[beginX] = beginY;
        }

        wavePaint.setColor(DEFAULT_BEHIND_WAVE_COLOR);
        final int wave2Shift = (int) (mDefaultWaveLength / 4);
        for (int beginX = 0; beginX < endX; beginX++) {
            canvas.drawLine(beginX, waveY[(beginX + wave2Shift) % endX], beginX, endY, wavePaint);
        }

        mWaveShader = new BitmapShader(bitmapLine, Shader.TileMode.REPEAT, Shader.TileMode.CLAMP);
        paint.setShader(mWaveShader);
    }


    /**
     * 测量view
     */
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        setMeasuredDimension(bitmapWidth, bitmapHight);
    }

    /**
     * 开始绘图
     */
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int layer = canvas.saveLayer(0, 0, mWindowWidth, mWindowHeight, this.paint, Canvas.ALL_SAVE_FLAG);
        //绘制背景图片
        canvas.drawBitmap(bitmapBg, 0, 0, this.paint);

        switch (animatorType) {

            case SQUARE:
                this.paint.setXfermode(xfermode_rect);
                //设置颜色
                this.paint.setColor(DEFAULT_RECT_COLOR);
                //绘图
                RectF rectF = new RectF(0, drawHight, bitmapWidth, bitmapHight);
                canvas.drawRect(rectF, this.paint);
                break;

            case WATER:
                this.paint.setXfermode(xfermode_water);
                if (this.paint.getShader() == null) {
                    this.paint.setShader(mWaveShader);
                }
                //波浪变化
                mShaderMatrix.setScale(
                        mWaveLengthRatio / DEFAULT_WAVE_LENGTH_RATIO,
                        mAmplitudeRatio / DEFAULT_AMPLITUDE_RATIO,
                        0,
                        mDefaultWaterLevel);
                //水位上升
                mShaderMatrix.postTranslate(
                        mWaveShiftRatio * bitmapWidth,
                        (DEFAULT_WATER_LEVEL_RATIO - mWaterLevelRatio) * bitmapHight);

                //重设矩阵
                mWaveShader.setLocalMatrix(mShaderMatrix);
                //绘图
                canvas.drawRect(0, 0, bitmapWidth,
                        bitmapHight, this.paint);
                break;
        }

        //最后设置为空
        paint.setXfermode(null);
        canvas.restoreToCount(layer);

    }


    /**
     * 波浪变化 <code>waveShiftRatio</code>.
     *
     * @param waveShiftRatio 默认0
     */
    private void setWaveShiftRatio(float waveShiftRatio) {
        if (mWaveShiftRatio != waveShiftRatio) {
            mWaveShiftRatio = waveShiftRatio;
            invalidate();
        }
    }


    /**
     * 水位高度变化 <code>waterLevelRatio</code>.
     *
     * @param waterLevelRatio 默认0.5
     */
    private void setWaterLevelRatio(float waterLevelRatio) {
        if (mWaterLevelRatio != waterLevelRatio) {
            mWaterLevelRatio = waterLevelRatio;
            invalidate();
        }
    }


    /**
     * 波峰变化 <code>amplitudeRatio</code>
     *
     * @param amplitudeRatio 默认0.5
     */
    public void setAmplitudeRatio(float amplitudeRatio) {
        if (mAmplitudeRatio != amplitudeRatio) {
            mAmplitudeRatio = amplitudeRatio;
            invalidate();
        }
    }


    /**
     * 播放动画
     */
    public void startAnimator() {
        switch (animatorType) {
            case SQUARE:
                startSquareAnim();
                break;
            case WATER:
                startWaterAnim();
                break;
        }
    }

    /**
     * 停止动画，停在当前帧
     */
    public void stopAnimator() {
        switch (animatorType) {
            case SQUARE:
                if (squareAnim != null && squareAnim.isRunning()) {
                    squareAnim.cancel();
                }
                break;
            case WATER:
                if (waterAnim != null && waterAnim.isRunning()) {
                    waterAnim.cancel();
                }
                break;
        }
    }


    /**
     * 结束动画，停在最后一帧
     */
    public void endAnimator() {
        switch (animatorType) {
            case SQUARE:
                if (squareAnim != null && squareAnim.isRunning()) {
                    squareAnim.end();
                }
                break;
            case WATER:
                if (waterAnim != null && waterAnim.isRunning()) {
                    waterAnim.end();
                }
                break;
        }
    }


    /**
     * 启动水位升动画
     */
    private void startWaterAnim() {
        if (waterAnim == null) {
            List<Animator> animators = new ArrayList<>();

            //波浪动画
            ObjectAnimator waveShiftAnim = ObjectAnimator.ofFloat(
                    this, "waveShiftRatio", 0f, 1f);
            waveShiftAnim.setRepeatCount(ValueAnimator.INFINITE);
            waveShiftAnim.setDuration(1000);
            waveShiftAnim.setInterpolator(new LinearInterpolator());
            animators.add(waveShiftAnim);

            // 上升动画
            ObjectAnimator waterLevelAnim = ObjectAnimator.ofFloat(
                    this, "waterLevelRatio", 0f, 1.05f);
            waterLevelAnim.setRepeatCount(ValueAnimator.INFINITE);
            waterLevelAnim.setDuration(5000);
            waterLevelAnim.setInterpolator(new DecelerateInterpolator());
            animators.add(waterLevelAnim);


            // 波峰动画，开启以后波峰会在平静与波浪之间反复变化，关闭后总是为波浪
//            ObjectAnimator amplitudeAnim = ObjectAnimator.ofFloat(
//                    this, "amplitudeRatio", 0.0001f, 0.05f);
//            amplitudeAnim.setRepeatCount(ValueAnimator.INFINITE);
//            amplitudeAnim.setRepeatMode(ValueAnimator.REVERSE);
//            amplitudeAnim.setDuration(5000);
//            amplitudeAnim.setInterpolator(new LinearInterpolator());
//            animators.add(amplitudeAnim);


            waterAnim = new AnimatorSet();
            waterAnim.playTogether(animators);
        }
        if (!waterAnim.isRunning()) {
            waterAnim.start();
        }
    }

    /**
     * 启动矩形动画
     */
    private void startSquareAnim() {

        if (squareAnim == null) {
            squareAnim = ValueAnimator.ofFloat(bitmapHight, 0);
            squareAnim.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
                @Override
                public void onAnimationUpdate(ValueAnimator animation) {
                    drawHight = (float) animation.getAnimatedValue();
                    invalidate();
                }
            });
            squareAnim.setInterpolator(new DecelerateInterpolator());
            squareAnim.setDuration(3000);
            squareAnim.setRepeatCount(ValueAnimator.INFINITE);
        }
        if (!squareAnim.isRunning()) {
            squareAnim.start();
        }
    }


    /**
     * 调用主动释放资源
     */
    public void destroy() {
        paint = null;
        xfermode_rect = null;
        xfermode_water = null;
        clearAnimation();
        squareAnim = null;
        waterAnim = null;
        mWaveShader = null;
        if (bitmapBg != null && !bitmapBg.isRecycled()) {
            bitmapBg.recycle();
            bitmapBg = null;
        }
    }


    /**
     * 在Activity销毁时自动释放资源
     */
    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        destroy();
    }
}

```
