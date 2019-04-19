/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

extern void register_component(char *name, void init());
extern void slog(char *msg);
extern void on_render(void render(int));
extern void on_click(void click());

void text_render(int frame)
{
        /*slog("Render");*/
}

void text_click()
{
        slog("Click!");
}

void text_init()
{
        slog("Hey!");
        on_render(text_render);
        on_click(text_click);
}

int init()
{
        register_component("text", text_init);
}
