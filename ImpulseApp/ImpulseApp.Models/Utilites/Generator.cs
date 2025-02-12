﻿using ImpulseApp.Models.AdModels;
using ImpulseApp.Models.StatModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace ImpulseApp.Utilites
{
    public class Generator
    {
        public static string GenerateShortAdUrl(int length = 5)
        {
            StringBuilder s = new StringBuilder(length);
            Random r = new Random(DateTime.Now.Millisecond);
            for (int i = 0; i<length; i++)
            {
                
                s.Append(r.Next(0, 10));
            }
            return s.ToString();
        }

        public static string GenerateClickName(Click click)
        {
            return "Переход с видео " + click.ClickCurrentStage + " на видео " + click.ClickNextStage;
        }
        public static string GenerateClickStamp(Click click)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(click.ClickCurrentStage).Append('-').Append(click.ClickNextStage).Append('-').Append(click.ClickNextTime);
            return sb.ToString();
        }
    }
}