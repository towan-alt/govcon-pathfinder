-- lovable-cron-fallback-reviewed: wake-on-enqueue runner, scheduled only when a pipeline run starts and unscheduled when it drains; needed so the job continues after the admin leaves the page
CREATE OR REPLACE FUNCTION public.samgov_pipeline_arm(_on boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $fn$
BEGIN
  IF _on THEN
    PERFORM cron.schedule('samgov-pipeline-runner', '* * * * *', $job$
      select net.http_post(
        url := 'https://qjvctpmpxeadawbigroz.supabase.co/functions/v1/samgov-pipeline',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select token from public.samgov_pipeline_secret where id = 1)),
        body := '{"action":"cron"}'::jsonb,
        timeout_milliseconds := 60000);
    $job$);
  ELSE
    BEGIN
      PERFORM cron.unschedule('samgov-pipeline-runner');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $fn$;
REVOKE ALL ON FUNCTION public.samgov_pipeline_arm(boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.samgov_pipeline_arm(boolean) TO service_role;