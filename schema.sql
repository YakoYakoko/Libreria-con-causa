-- Crear tabla de Libros
CREATE TABLE public.libros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de Compras
CREATE TABLE public.compras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de Items de Compras (Detalle)
CREATE TABLE public.compras_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    compra_id UUID REFERENCES public.compras(id) ON DELETE CASCADE,
    libro_id UUID REFERENCES public.libros(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Seguridad (RLS - Row Level Security)
ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_items ENABLE ROW LEVEL SECURITY;

-- Los libros pueden ser leídos por cualquiera
CREATE POLICY "Libros son públicos" ON public.libros FOR SELECT USING (true);

-- Solo los usuarios autenticados (o admins) pueden insertar/actualizar libros. 
-- (Por simplicidad inicial, permitimos a todos los autenticados. Idealmente se valida el rol).
CREATE POLICY "Admins pueden modificar libros" ON public.libros FOR ALL USING (auth.role() = 'authenticated');

-- Las compras solo pueden ser leídas e insertadas por el usuario que las hizo
CREATE POLICY "Usuarios ven sus propias compras" ON public.compras FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar compras" ON public.compras FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios ven sus propios items" ON public.compras_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.compras c WHERE c.id = compra_id AND c.user_id = auth.uid())
);
CREATE POLICY "Usuarios pueden insertar items" ON public.compras_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.compras c WHERE c.id = compra_id AND c.user_id = auth.uid())
);
