package com.mediseen.app.ui.views

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Space
import android.widget.TextView
import androidx.annotation.ColorInt
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.google.android.material.textfield.TextInputLayout
import com.google.android.material.textfield.TextInputEditText
import com.mediseen.app.R

fun Context.dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

fun View.margin(top: Int = 0, bottom: Int = 0, start: Int = 0, end: Int = 0): View = apply {
    layoutParams = (layoutParams as? ViewGroup.MarginLayoutParams ?: LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
    )).apply {
        topMargin = context.dp(top)
        bottomMargin = context.dp(bottom)
        marginStart = context.dp(start)
        marginEnd = context.dp(end)
    }
}

fun LinearLayout.gap(height: Int = 14) {
    addView(Space(context).apply { layoutParams = LinearLayout.LayoutParams(1, context.dp(height)) })
}

fun LinearLayout.heading(text: String, size: Float = 25f): TextView = TextView(context).apply {
    this.text = text
    textSize = size
    setTextColor(ContextCompat.getColor(context, R.color.ink))
    letterSpacing = -0.018f
    setLineSpacing(0f, 0.96f)
    setTypeface(typeface, Typeface.BOLD)
}.also(::addView)

fun LinearLayout.section(text: String): TextView = heading(text, 20f)

fun LinearLayout.body(text: String, muted: Boolean = true): TextView = TextView(context).apply {
    this.text = text
    textSize = 15.5f
    setTextColor(ContextCompat.getColor(context, if (muted) R.color.muted_ink else R.color.ink))
    setLineSpacing(0f, 1.22f)
}.also(::addView)

fun Context.rounded(@ColorInt fill: Int, radius: Int = 16, @ColorInt stroke: Int? = null): GradientDrawable =
    GradientDrawable().apply {
        shape = GradientDrawable.RECTANGLE
        setColor(fill)
        cornerRadius = dp(radius).toFloat()
        stroke?.let { setStroke(dp(1), it) }
    }

fun LinearLayout.panel(
    backgroundColor: Int = Color.WHITE,
    block: LinearLayout.() -> Unit,
): MaterialCardView = MaterialCardView(context).apply {
    radius = context.dp(22).toFloat()
    cardElevation = context.dp(1).toFloat()
    strokeWidth = 0
    setCardBackgroundColor(backgroundColor)
    addView(LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(context.dp(20), context.dp(20), context.dp(20), context.dp(20))
        block()
    })
}.also { addView(it); it.margin(bottom = 12) }

fun LinearLayout.action(label: String, onClick: () -> Unit): MaterialButton = MaterialButton(
    context,
    null,
    com.google.android.material.R.attr.materialButtonStyle,
).apply {
    text = label
    isAllCaps = false
    textSize = 15f
    setTypeface(typeface, Typeface.BOLD)
    cornerRadius = context.dp(16)
    minimumHeight = context.dp(56)
    setTextColor(Color.WHITE)
    backgroundTintList = null
    background = ContextCompat.getDrawable(context, R.drawable.brand_action)
    stateListAnimator = null
    letterSpacing = 0.01f
    setOnClickListener { onClick() }
}.also { addView(it); it.margin(bottom = 12) }

fun LinearLayout.secondaryAction(label: String, onClick: () -> Unit): MaterialButton = action(label, onClick).apply {
    setTextColor(ContextCompat.getColor(context, R.color.ink))
    backgroundTintList = null
    background = context.rounded(Color.WHITE, 16, ContextCompat.getColor(context, R.color.hairline))
    strokeWidth = 0
    cornerRadius = context.dp(16)
    elevation = context.dp(1).toFloat()
}

fun LinearLayout.input(
    label: String,
    value: String = "",
    inputType: Int = InputType.TYPE_CLASS_TEXT,
    maxLines: Int = 1,
    onChanged: (String) -> Unit = {},
): EditText {
    val edit = TextInputEditText(context).apply {
        setText(value)
        this.inputType = inputType
        this.maxLines = maxLines
        minimumHeight = context.dp(56)
        setPadding(context.dp(16), 0, context.dp(16), 0)
        background = null
        setTextColor(ContextCompat.getColor(context, R.color.ink))
        setHintTextColor(ContextCompat.getColor(context, R.color.muted_ink))
        setSelection(text?.length ?: 0)
        addTextChangedListener(SimpleTextWatcher(onChanged))
    }
    addView(TextInputLayout(context).apply {
        hint = label
        boxBackgroundMode = TextInputLayout.BOX_BACKGROUND_OUTLINE
        boxBackgroundColor = ContextCompat.getColor(context, R.color.surface_subtle)
        setBoxCornerRadii(
            context.dp(14).toFloat(), context.dp(14).toFloat(),
            context.dp(14).toFloat(), context.dp(14).toFloat(),
        )
        setBoxStrokeColorStateList(ColorStateList(
            arrayOf(
                intArrayOf(android.R.attr.state_focused),
                intArrayOf(android.R.attr.state_enabled),
                intArrayOf(),
            ),
            intArrayOf(
                ContextCompat.getColor(context, R.color.brand_violet),
                ContextCompat.getColor(context, R.color.hairline),
                ContextCompat.getColor(context, R.color.hairline),
            ),
        ))
        addView(
            edit,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            ),
        )
    }.also { it.margin(bottom = 12) })
    return edit
}

fun LinearLayout.choices(
    label: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit,
): ChipGroup {
    body(label, muted = false).setTypeface(Typeface.DEFAULT, Typeface.BOLD)
    val group = ChipGroup(context).apply {
        isSingleSelection = true
        isSelectionRequired = true
        options.forEach { option ->
            addView(Chip(context).apply {
                id = View.generateViewId()
                text = option.replace('_', ' ').replaceFirstChar(Char::uppercase)
                isCheckable = true
                isChecked = option == selected
                minHeight = context.dp(44)
                chipCornerRadius = context.dp(12).toFloat()
                chipStrokeWidth = context.dp(1).toFloat()
                chipStrokeColor = ContextCompat.getColorStateList(context, R.color.hairline)
                setOnClickListener { onSelected(option) }
            })
        }
    }
    addView(group)
    gap(10)
    return group
}

fun LinearLayout.loading(label: String): View = LinearLayout(context).apply {
    orientation = LinearLayout.HORIZONTAL
    gravity = Gravity.CENTER_VERTICAL
    addView(CircularProgressIndicator(context).apply {
        isIndeterminate = true
        layoutParams = LinearLayout.LayoutParams(context.dp(28), context.dp(28))
    })
    addView(TextView(context).apply {
        text = label
        textSize = 14f
        setTextColor(ContextCompat.getColor(context, R.color.muted_ink))
        setPadding(context.dp(12), 0, 0, 0)
    })
}.also { addView(it); it.margin(top = 8, bottom = 16) }

fun LinearLayout.error(message: String): TextView = TextView(context).apply {
    text = message
    textSize = 14f
    setTextColor(ContextCompat.getColor(context, R.color.danger))
    background = context.rounded(ContextCompat.getColor(context, R.color.brand_pink_soft), 12)
    setPadding(context.dp(14), context.dp(12), context.dp(14), context.dp(12))
}.also { addView(it); it.margin(bottom = 14) }

fun LinearLayout.bullet(text: String, color: Int = ContextCompat.getColor(context, R.color.ink)): TextView =
    TextView(context).apply {
        this.text = "•  $text"
        textSize = 14f
        setTextColor(color)
        setPadding(0, context.dp(4), 0, context.dp(4))
    }.also(::addView)

fun LinearLayout.image(resource: Int, description: String, size: Int = 64): ImageView = ImageView(context).apply {
    setImageResource(resource)
    contentDescription = description
    scaleType = ImageView.ScaleType.CENTER_INSIDE
    layoutParams = LinearLayout.LayoutParams(context.dp(size), context.dp(size)).apply { gravity = Gravity.CENTER_HORIZONTAL }
}.also(::addView)

private class SimpleTextWatcher(private val changed: (String) -> Unit) : android.text.TextWatcher {
    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
    override fun afterTextChanged(s: android.text.Editable?) = changed(s?.toString().orEmpty())
}
